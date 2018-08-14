(module
  (import "console" "log" (func $log (param i32) (param i32)))
  (memory (export "memory") 10000 10000)

  (func (export "set") (param $idx i32) (result i32)
    (local $b64 i32)
    (local $b i32)
    (local $r i32)

    (local $int i64)
    (local $int_upd i64)

    (local $lvl i32)
    (local $i i32)

    ;; load the current value
    (set_local $int 
      (i64.load offset=4096 (tee_local $b64
        (i32.mul (i32.const 8)
          (tee_local $b (i32.div_u (get_local $idx) (i32.const 64)))
        )
      ))
    )

    ;; update it
    (i64.store offset=4096 (get_local $b64)
      (tee_local $int_upd
        (i64.or
          (get_local $int)
          (i64.shl (i64.const 1)
            (i64.and (i64.extend_u/i32 (get_local $idx)) (i64.const 63))
          )
        )
      )
    )

    ;; if nothing has changed, short curcuit
    (if (i64.eq (get_local $int_upd) (get_local $int))
      (return (i32.const 0))
    )

    ;; load bitfield size (first offset)
    (set_local $lvl (i32.load (tee_local $i (i32.const 4))))

    ;; update index
    (block $end_loop
      (loop $start_loop
        (br_if $end_loop (i32.eq (get_local $lvl) (i32.const 0)))

        (set_local $r
          (i32.and (get_local $b) (i32.const 63))
        )

        (set_local $b64
          (i32.add (get_local $lvl)
            (i32.mul (tee_local $b (i32.div_u (get_local $b) (i32.const 64))) (i32.const 8))
          )
        )

        (set_local $int (i64.load offset=4096 (get_local $b64)))

        (if (i64.gt_u (get_local $int_upd) (i64.const 0))
          (then (set_local $int_upd
            (i64.or (get_local $int)
              (i64.shl (i64.const 1) (i64.extend_u/i32 (get_local $r)))
            )
          ))
          (else (set_local $int_upd
            (i64.and (get_local $int)
              (i64.xor
                (i64.shl (i64.const 1) (i64.extend_u/i32 (get_local $r)))
                (i64.const 0xffffffffffffffff)
              )
            )
          ))
        )

        (if (i64.eq (get_local $int_upd) (get_local $int))
          (return (i32.const 1))
        )

        (i64.store offset=4096 (get_local $b64) (get_local $int_upd))

        (set_local $lvl (i32.load (tee_local $i (i32.add (get_local $i) (i32.const 4)))))
        (br $start_loop)
      )
    )

    (return (i32.const 1))
  )

  (func (export "get") (param $idx i32) (result i32)
    (if (i64.gt_u 
        (i64.and
          (i64.load offset=4096 (i32.mul (i32.div_u (get_local $idx) (i32.const 64)) (i32.const 8)))
          (i64.shl (i64.const 1)
            (i64.and (i64.extend_u/i32 (get_local $idx)) (i64.const 63))
          )
        )
        (i64.const 0)
      )
      (return (i32.const 1))
    )
    (return (i32.const 0))
  )

  (func (export "next_true") (param $idx i32) (result i32)
    (local $b i32)
    (local $b64 i32)
    (local $i i32)
    (local $lvl i32)
    (local $ctz i64)

    (set_local $b64
      (i32.mul (i32.const 8)
        (tee_local $b (i32.div_u (get_local $idx) (i32.const 64)))
      )
    )

    ;; load bitfield size (first offset)
    (set_local $lvl (i32.load (tee_local $i (i32.const 0))))

    ;; update index
    (block $end_loop
      (loop $start_loop
        (if (i64.ne (tee_local $ctz (i64.ctz (i64.load offset=4096 (get_local $b64)))) (i64.const 64))
          (then
            (block $end_down_left
              (loop $start_down_left
                (br_if $end_down_left (i32.eq (get_local $i) (i32.const 0)))
                (set_local $ctz
                  (i64.ctz (i64.load offset=4096
                    (i32.add
                      (i32.load (tee_local $i (i32.sub (get_local $i) (i32.const 4))))
                      (i32.mul (i32.const 8)
                        (tee_local $b (i32.add
                          (i32.mul (get_local $b) (i32.const 64))
                          (i32.wrap/i64 (get_local $ctz))
                        ))
                      )
                    )
                  ))
                )
                (br $start_down_left)
              )
            )
            (return (i32.add
              (i32.mul (get_local $b) (i32.const 64))
              (i32.wrap/i64 (get_local $ctz))
            ))
          )
        )

        (set_local $lvl (i32.load (tee_local $i (i32.add (get_local $i) (i32.const 4)))))
        (set_local $b64
          (i32.add (get_local $lvl)
            (i32.mul (i32.const 8)
              (tee_local $b (i32.div_u (get_local $b) (i32.const 64)))
            )
          )
        )

        (br_if $end_loop (i32.eq (get_local $lvl) (i32.const 0)))
        (br $start_loop)
      )
    )

    (i32.const -1)
  )
)
